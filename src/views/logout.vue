<template>
  <v-container />
</template>

<script>
import { request } from '@/http'

export default {
  name: 'Logout',
  mounted () {
    request({
      method: 'POST',
      url: '/api/misc/logout'
    }).then(() => {
      this.$router.push('/')
      location.reload(true)
    })
  }
}
</script>
