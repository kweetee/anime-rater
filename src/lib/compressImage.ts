// Сжимает картинку: максимальная сторона 600px, формат JPEG.
// Возвращает Blob, который можно сохранять в Dexie.
export async function compressImage(
  file: File,
  maxSide = 600,
  quality = 0.85,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  // Во сколько раз уменьшать (увеличивать картинку не нужно)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Не удалось создать canvas')
  }

  // Белый фон: у JPEG нет прозрачности
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Не удалось сжать картинку'))
      },
      'image/jpeg',
      quality,
    )
  })
}
