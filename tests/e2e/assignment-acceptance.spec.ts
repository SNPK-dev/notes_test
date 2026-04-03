import { expect, test } from '@playwright/test'

test.describe('assignment acceptance coverage', () => {
  test('verifies the explicit two-page flow through primary navigation', async ({
    page,
  }) => {
    await page.goto('/')

    const navigation = page.getByRole('navigation', {
      name: 'Основная навигация',
    })
    const navigationLinks = navigation.getByRole('link')

    await expect(navigationLinks).toHaveCount(2)
    await expect(
      navigation.getByRole('link', { name: 'Список заметок' }),
    ).toBeVisible()
    await expect(
      navigation.getByRole('link', { name: 'Новая заметка' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 1, name: 'Заметки' }),
    ).toBeVisible()

    await navigation.getByRole('link', { name: 'Новая заметка' }).click()
    await expect(page).toHaveURL(/\/editor$/)
    await expect(titleInput(page)).toBeVisible()

    await navigation.getByRole('link', { name: 'Список заметок' }).click()
    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Заметки' }),
    ).toBeVisible()
  })

  test('covers full note CRUD and keeps list preview read-only', async ({
    page,
  }) => {
    const createdTitle = 'Note CRUD create'
    const updatedTitle = 'Note CRUD updated'

    await openNewEditor(page)
    await titleInput(page).fill(createdTitle)
    await page.getByRole('button', { name: 'Сохранить заметку' }).click()
    await closeSavedNotice(page)

    await expect(page).toHaveURL(/\/editor\/.+/)
    await page.getByRole('link', { name: 'Список заметок' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(createdTitle)).toBeVisible()
    await expect(page.getByLabel('Заголовок заметки')).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Сохранить заметку' }),
    ).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: 'Изменить' }).first(),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Удалить' }).first(),
    ).toBeVisible()

    await page.getByRole('link', { name: 'Изменить' }).first().click()
    await expect(page).toHaveURL(/\/editor\/.+/)

    await titleInput(page).fill(updatedTitle)
    await page.getByRole('button', { name: 'Сохранить заметку' }).click()
    await closeSavedNotice(page)
    await page.getByRole('link', { name: 'Список заметок' }).click()

    await expect(page.getByText(updatedTitle)).toBeVisible()

    await page.getByRole('button', { name: 'Удалить' }).first().click()
    const deleteDialog = page.getByRole('dialog', { name: 'Удалить заметку?' })
    await expect(deleteDialog).toBeVisible()
    await deleteDialog.getByRole('button', { name: 'Удалить заметку' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(updatedTitle)).toHaveCount(0)
    await expect(page.getByText('Пока нет сохранённых заметок')).toBeVisible()
  })

  test('covers full todo CRUD flow through browser behavior', async ({
    page,
  }) => {
    const todoText = 'Подготовить acceptance summary'

    await openNewEditor(page)
    await titleInput(page).fill('Todo CRUD note')

    await page.getByRole('button', { name: 'Добавить задачу' }).click()
    const todoItem = page.getByRole('listitem').first()
    await todoItem.getByLabel('Текст задачи').fill(todoText)
    await page.getByRole('button', { name: 'Сохранить заметку' }).click()
    await closeSavedNotice(page)

    await page.getByRole('link', { name: 'Список заметок' }).click()
    await expect(
      page.getByRole('list', { name: 'Список задач заметки' }).first(),
    ).toBeVisible()
    await expect(
      page.getByRole('listitem').filter({ hasText: todoText }),
    ).toBeVisible()

    await page.getByRole('link', { name: 'Изменить' }).first().click()
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await page
      .getByRole('listitem')
      .first()
      .getByRole('button', { name: 'Удалить' })
      .click()
    await page.getByRole('button', { name: 'Сохранить заметку' }).click()
    await closeSavedNotice(page)
    await page.getByRole('link', { name: 'Список заметок' }).click()

    await expect(page.getByText(todoText)).toHaveCount(0)
    await expect(page.getByText('У заметки пока нет задач.')).toBeVisible()
  })

  test('uses modal confirmations for cancel, delete, and route leave without native dialogs', async ({
    page,
  }) => {
    const nativeDialogs: string[] = []

    page.on('dialog', (dialog) => {
      nativeDialogs.push(dialog.type())
      void dialog.dismiss()
    })

    await openNewEditor(page)
    await titleInput(page).fill('Modal coverage note')

    await page.getByRole('button', { name: 'Сбросить изменения' }).click()
    await expect(
      page.getByRole('dialog', { name: 'Отменить несохранённые изменения?' }),
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Продолжить редактирование' })
      .click()
    await expect(titleInput(page)).toHaveValue('Modal coverage note')

    await page.getByRole('link', { name: 'Список заметок' }).click()
    await expect(
      page.getByRole('dialog', { name: 'Покинуть редактор?' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Остаться в редакторе' }).click()
    await expect(page).toHaveURL(/\/editor$/)

    await page.getByRole('button', { name: 'Сохранить заметку' }).click()
    await closeSavedNotice(page)
    await expect(page).toHaveURL(/\/editor\/.+/)

    await page.getByRole('link', { name: 'Список заметок' }).click()
    await page.getByRole('button', { name: 'Удалить' }).first().click()
    await expect(
      page.getByRole('dialog', { name: 'Удалить заметку?' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Оставить заметку' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Modal coverage note')).toBeVisible()

    expect(nativeDialogs).toEqual([])
  })

  test('runs a minimal responsive smoke across list and editor flows', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await expect(
      page.getByRole('link', { name: 'Список заметок' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Новая заметка' }),
    ).toBeVisible()
    await page.getByRole('link', { name: 'Новая заметка' }).click()
    await expect(page).toHaveURL(/\/editor$/)
    await expect(titleInput(page)).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Сохранить заметку' }),
    ).toBeVisible()

    await page.setViewportSize({ width: 1280, height: 900 })
    await page.getByRole('link', { name: 'Список заметок' }).click()
    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Заметки' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Новая заметка' }),
    ).toBeVisible()
  })
})

function titleInput(page: import('@playwright/test').Page) {
  return page.getByLabel('Заголовок заметки')
}

async function openNewEditor(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Новая заметка' }).click()
  await expect(page).toHaveURL(/\/editor$/)
  await expect(titleInput(page)).toBeVisible()
}

async function closeSavedNotice(page: import('@playwright/test').Page) {
  const dialog = page.getByRole('dialog', { name: 'Сохранено' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Понятно' }).click()
  await expect(dialog).toHaveCount(0)
}
