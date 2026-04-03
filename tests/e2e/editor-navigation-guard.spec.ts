import { expect, test } from '@playwright/test'

test.describe('editor navigation guard', () => {
  test('leaving /editor with dirty draft to the list page opens confirmation modal', async ({
    page,
  }) => {
    await openNewEditor(page)
    await page
      .getByLabel('Заголовок заметки')
      .fill('Dirty draft before list navigation')

    await page.getByRole('link', { name: 'Список заметок' }).click()

    await expect(
      page.getByRole('dialog', { name: 'Покинуть редактор?' }),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/editor$/)
  })

  test('leaving /editor/:id with dirty draft to another editor route opens confirmation modal', async ({
    page,
  }) => {
    await createSavedNote(page, 'Existing note for route switch')

    await page.getByLabel('Заголовок заметки').fill('Dirty existing note draft')
    await page.getByRole('link', { name: 'Новая заметка' }).click()

    await expect(
      page.getByRole('dialog', { name: 'Покинуть редактор?' }),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/editor\/.+/)
    await expect(page.getByLabel('Заголовок заметки')).toHaveValue(
      'Dirty existing note draft',
    )
  })

  test('confirming the modal allows navigation and discards the current dirty draft', async ({
    page,
  }) => {
    await openNewEditor(page)
    await page
      .getByLabel('Заголовок заметки')
      .fill('Draft to discard after confirm')

    await page.getByRole('link', { name: 'Список заметок' }).click()
    await page.getByRole('button', { name: 'Покинуть редактор' }).click()

    await expect(page).toHaveURL('/')
    await page.getByRole('link', { name: 'Новая заметка' }).click()
    await expect(page).toHaveURL(/\/editor$/)
    await expect(page.getByLabel('Заголовок заметки')).toHaveValue('')
  })

  test('cancelling the modal keeps the user on the current editor route and preserves the draft', async ({
    page,
  }) => {
    await openNewEditor(page)
    await page.getByLabel('Заголовок заметки').fill('Draft that must stay')

    await page.getByRole('link', { name: 'Список заметок' }).click()
    await page.getByRole('button', { name: 'Остаться в редакторе' }).click()

    await expect(page).toHaveURL(/\/editor$/)
    await expect(
      page.getByRole('dialog', { name: 'Покинуть редактор?' }),
    ).toHaveCount(0)
    await expect(page.getByLabel('Заголовок заметки')).toHaveValue(
      'Draft that must stay',
    )
  })

  test('navigating away with isDirty = false proceeds without confirmation', async ({
    page,
  }) => {
    await createSavedNote(page, 'Clean note for list navigation')

    await page.getByRole('link', { name: 'Список заметок' }).click()

    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('dialog', { name: 'Покинуть редактор?' }),
    ).toHaveCount(0)
  })
})

async function createSavedNote(
  page: import('@playwright/test').Page,
  title: string,
) {
  await openNewEditor(page)
  await page.getByLabel('Заголовок заметки').fill(title)
  await page.getByRole('button', { name: 'Сохранить заметку' }).click()
  await closeSavedNotice(page)
  await expect(page).toHaveURL(/\/editor\/.+/)
}

async function openNewEditor(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Новая заметка' }).click()
  await expect(page).toHaveURL(/\/editor$/)
  await expect(page.getByLabel('Заголовок заметки')).toBeVisible()
}

async function closeSavedNotice(page: import('@playwright/test').Page) {
  const dialog = page.getByRole('dialog', { name: 'Сохранено' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Понятно' }).click()
  await expect(dialog).toHaveCount(0)
}
