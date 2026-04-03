import { expect, test } from '@playwright/test'

test.describe('editor history and reload', () => {
  test('reload does not restore transient undo/redo history and saved note survives reload', async ({
    page,
  }) => {
    const savedTitle = 'Saved note survives reload'
    const dirtyTitle = 'Saved note with transient change'

    await createSavedNote(page, savedTitle)
    await updateTitle(page, dirtyTitle)

    await expect(undoButton(page).first()).toBeEnabled()
    await expect(redoButton(page).first()).toBeDisabled()

    await undoButton(page).first().click()

    await expect(titleInput(page)).toHaveValue(savedTitle)
    await expect(undoButton(page).first()).toBeDisabled()
    await expect(redoButton(page).first()).toBeEnabled()

    await page.reload()

    await expect(page).toHaveURL(/\/editor\/.+/)
    await expect(titleInput(page)).toHaveValue(savedTitle)
    await expect(undoButton(page).first()).toBeDisabled()
    await expect(redoButton(page).first()).toBeDisabled()
    await expect(page.getByText('Статус: Синхронизировано')).toBeVisible()
  })

  test('discarded draft does not return after reload', async ({ page }) => {
    const savedTitle = 'Persisted title after discard'
    const discardedTitle = 'Discarded draft title'

    await createSavedNote(page, savedTitle)
    await updateTitle(page, discardedTitle)

    await page.getByRole('button', { name: 'Сбросить изменения' }).click()
    await page.getByRole('button', { name: 'Сбросить черновик' }).click()

    await expect(titleInput(page)).toHaveValue(savedTitle)
    await expect(page.getByText('Статус: Синхронизировано')).toBeVisible()

    await page.reload()

    await expect(titleInput(page)).toHaveValue(savedTitle)
    await expect(titleInput(page)).not.toHaveValue(discardedTitle)
    await expect(undoButton(page).first()).toBeDisabled()
    await expect(redoButton(page).first()).toBeDisabled()
  })

  test('undo and redo work through visible editor UI', async ({ page }) => {
    await openNewEditor(page)

    await updateTitle(page, 'UI history step one')
    await updateTitle(page, 'UI history step two')

    await undoButton(page).first().click()
    await expect(titleInput(page)).toHaveValue('UI history step one')
    await expect(redoButton(page).first()).toBeEnabled()

    await redoButton(page).first().click()
    await expect(titleInput(page)).toHaveValue('UI history step two')
  })

  test('undo and redo work through keyboard shortcuts on the editor page', async ({
    page,
  }) => {
    await openNewEditor(page)

    await updateTitle(page, 'Keyboard history step one')
    await updateTitle(page, 'Keyboard history step two')

    await titleInput(page).click()
    await page.keyboard.press('Control+Z')

    await expect(titleInput(page)).toHaveValue('Keyboard history step one')
    await expect(redoButton(page).first()).toBeEnabled()

    await page.keyboard.press('Control+Shift+Z')

    await expect(titleInput(page)).toHaveValue('Keyboard history step two')
    await expect(undoButton(page).first()).toBeEnabled()
  })
})

function titleInput(page: import('@playwright/test').Page) {
  return page.getByLabel('Заголовок заметки')
}

function undoButton(page: import('@playwright/test').Page) {
  return page.getByRole('button', { name: 'Отменить изменения' })
}

function redoButton(page: import('@playwright/test').Page) {
  return page.getByRole('button', { name: 'Вернуть изменения' })
}

async function updateTitle(
  page: import('@playwright/test').Page,
  value: string,
) {
  await titleInput(page).fill(value)
}

async function createSavedNote(
  page: import('@playwright/test').Page,
  title: string,
) {
  await openNewEditor(page)
  await updateTitle(page, title)
  await page.getByRole('button', { name: 'Сохранить заметку' }).click()
  await closeSavedNotice(page)
  await expect(page).toHaveURL(/\/editor\/.+/)
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
