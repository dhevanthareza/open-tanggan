<script setup lang="ts">
import { useCreateFamily } from '~/queries/families'
import { familyInput, type FamilyInput } from '~/schemas'

const router = useRouter()
const { mutate, isPending, error } = useCreateFamily()
const validationError = ref('')

const submit = (data: FamilyInput) => {
  validationError.value = ''
  const parsed = familyInput.safeParse(data)
  if (!parsed.success) {
    validationError.value = parsed.error.issues.map(i => i.message).join(' · ')
    return
  }
  mutate(parsed.data, {
    onSuccess: ({ id }) => router.push(`/family/${id}`),
  })
}
</script>

<template>
  <FamilyForm :loading="isPending" :error="validationError || error?.message" @submit="submit" />
</template>
