<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'building'
  },
  id: String
})

const imageUrl = ref('')
const imageError = ref(false)

// Función para cargar imagen dinámicamente
const loadImage = async () => {
  try {
    const folderMap = {
      building: 'gebaeude',
      technology: 'technologien',
      ship: 'schiffe',
      defense: 'verteidigung',
      officer: 'offiziere'
    }
    
    const folder = folderMap[props.type] || 'gebaeude'
    const imageName = props.id.toLowerCase()
    
    // Import dinámico con Vite
    const module = await import(`@/assets/${folder}/${imageName}.png`)
    imageUrl.value = module.default
    imageError.value = false
  } catch (error) {
    console.warn(`No se pudo cargar la imagen: ${props.id}`, error)
    imageError.value = true
    
    // Cargar imagen por defecto
    try {
      const defaultModule = await import(`@/assets/gebaeude/default.png`)
      imageUrl.value = defaultModule.default
    } catch {
      imageUrl.value = ''
    }
  }
}

// Cargar la imagen cuando el componente se monte o cambien las props
loadImage()
</script>

<template>
  <img 
    v-if="imageUrl"
    :src="imageUrl"
    :alt="id"
    class="object-contain"
  />
  <div v-else class="bg-gray-200 flex items-center justify-center">
    <span class="text-xs">No image</span>
  </div>
</template>