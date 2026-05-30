import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import { randomUUID } from 'node:crypto'

export default class ImagesController {
  async index({ view }: HttpContext) {
    const disk = drive.use('images')
    const { objects } = await disk.listAll('', { recursive: true })

    const files = await Promise.all(
      [...objects]
        .filter((object) => object.isFile)
        .map(async (object) => ({
          name: object.name,
          key: object.key,
          url: await object.getUrl(),
        }))
    )

    files.sort((a, b) => a.name.localeCompare(b.name))

    return view.render('pages/images', { files })
  }

  async upload({ request, response, session }: HttpContext) {
    const images = request.files('images', {
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    })

    if (!images.length) {
      session.flash('errors', { images: 'Veuillez sélectionner au moins un fichier.' })
      return response.redirect().toPath('/images')
    }

    const invalidImage = images.find((image) => !image.isValid)
    if (invalidImage) {
      session.flash('errors', { images: invalidImage.errors[0]?.message ?? 'Fichier invalide.' })
      return response.redirect().toPath('/images')
    }

    await Promise.all(
      images.map(async (image) => {
        const safeClientName = image.clientName.replace(/[^a-zA-Z0-9._-]/g, '_')
        const fileName = `${randomUUID()}-${safeClientName}`

        await image.moveToDisk(fileName, 'images')
      })
    )

    return response.redirect().toPath('/images')
  }
}
