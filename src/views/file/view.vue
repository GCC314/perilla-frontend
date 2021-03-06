<template>
  <v-container fluid>
    <v-layout fill-height>
      <v-flex>
        <v-card>
          <v-card-title>
            <div>
              <div class="headline" v-text="file.name" />
              <div class="subheading">{{ file.creator }}</div>
            </div>
          </v-card-title>
          <v-card-text>
            <b>{{ $t("hash") }}:</b>
            <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ file.hash }}</pre>
            <br/>
            <b>{{ $t("size") }}:</b>
            <pre>{{ file.size }}</pre>
            <br/>
            <b>{{ $t("type") }}:</b>
            <pre>{{ file.type }}</pre>
            <br/>
            <article class="markdown-body" v-html="rendered" />
          </v-card-text>
          <v-card-actions>
            <v-chip v-for="(tag, i) in file.tags" :key="i">{{ tag }}</v-chip>
            <v-spacer />
            <v-btn v-text="$t('download')" color="primary" @click="download"/>
            <v-btn v-text="$t('edit')" :to="'/file/edit/' + id" />
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
    <v-dialog v-model="downloading" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          {{ $t('downloading') }}
          <v-progress-linear v-model="progress" color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { client, request } from '@/http'
import render from '@/helper/markdown'

export default {
  name: 'FileView',
  props: ['id'],
  data () {
    return {
      file: {
        id: null,
        name: 'Loading',
        type: '',
        description: '',
        hash: '',
        size: 0,
        updated: null,
        tags: ['Untagged'],
        owner: null,
        creator: null
      },
      downloading: true,
      progress: 0
    }
  },
  mounted () {
    this.$store.commit('toggleLoading', true)
    request({
      url: '/api/file',
      params: { entry: this.$store.state.entry, id: this.id }
    })
      .then(file => {
        this.file = file
      })
      .catch(e => {
        this.$store.commit('updateMessage', e.message)
      })
      .finally(() => {
        this.$store.commit('toggleLoading', false)
      })
  },
  computed: {
    rendered: function () {
      return render(this.file.description)
    }
  },
  methods: {
    download () {
      this.downloading = true
      client({
        url: '/api/file/raw',
        method: 'GET',
        params: { entry: this.$store.state.entry, id: this.id },
        responseType: 'blob',
        onDownloadProgress: e => {
          this.progress = Math.round((e.loaded * 100) / e.total)
        }
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', this.file.name)
        document.body.appendChild(link)
        link.click()
        this.progress = 100 // OCD
        this.downloading = false
      })
    }
  }
}
</script>
