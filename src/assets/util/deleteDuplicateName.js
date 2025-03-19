export const deleteDuplicateName = (nombre = null, apellido = null) => {
  let string = ''

  if (nombre === apellido) string = nombre
  else string = `${nombre || ''} ${apellido || ''}`
  return string
}
