/**
 * Whether a closing or hiding window should hand focus back to whatever had it
 * before the window opened.
 *
 * Keyboard users always get it back, so they aren't stranded at the top of the
 * page. A click or tap doesn't put anyone back in a text field: on a phone that
 * would pop the keyboard up, and with a mouse it looks like the box selected
 * itself. Focus still goes back to anything else, such as a desktop icon.
 */
export function shouldReturnFocus({
  byKeyboard,
  targetIsEditable,
}: {
  byKeyboard: boolean
  targetIsEditable: boolean
}): boolean {
  return byKeyboard || !targetIsEditable
}
