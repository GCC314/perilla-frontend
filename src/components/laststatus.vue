<template>
  <v-chip label :outline="outline" :color="color" :text-color="textColor">
    {{ details }}
  </v-chip>
</template>

<script>
import { request } from '@/http'
import { resultDisplay } from '@/interfaces'

export default {
  name: 'lastStatus',
  props: ['id'],
  data () {
    return {
      outline: true,
      color: '#3498db',
      textColor: undefined,
      details: 'Fetching'
    }
  },
  mounted () {
    request({
      url: '/api/solution/list',
      params: {
        entry: this.$store.state.entry,
        creator: this.$store.state.user,
        skip: 0,
        limit: 1,
        problem: this.id,
        sortBy: 'score',
        descending: true
      }
    }).then(result => {
      if (result instanceof Array && result.length === 1) {
        let status = result[0].status
        this.outline = resultDisplay[status].outline
        this.color = resultDisplay[status].color
        this.details = resultDisplay[status].text
        this.textColor = resultDisplay[status].textColor
      } else {
        this.outline = false
        this.color = '#34495e'
        this.details = 'No data'
        this.textColor = 'white'
      }
    }).catch(err => {
      this.outline = false
      this.color = '#e74c3c'
      this.details = 'Error'
      this.textColor = 'white'
    })
  }
}
</script>
