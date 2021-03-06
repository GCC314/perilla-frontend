<template>
  <v-container fluid>
    <v-layout fill-height>
      <v-flex sm12>
        <v-card class="fill">
          <v-toolbar>
            <v-toolbar-title v-text="$t('edit_problem', [problem.id])" />
            <v-toolbar-items>
              <v-btn flat v-text="$t('edit')" :disabled="view === 0" @click="view = 0;"/>
              <v-btn flat v-text="$t('data')" :disabled="view === 1" @click="view = 1;"/>
              <v-btn flat v-text="$t('import')" v-show="canImport" @click="showImport = 1"/>
            </v-toolbar-items>
            <v-spacer />
            <v-toolbar-items>
              <v-btn flat v-text="$t('remove')" :disabled="isnew" @click="remove" color="accent"/>
              <v-btn flat v-text="$t('save')" @click="save" color="primary" /><v-btn flat v-text="$t('show')" :disabled="isnew" :to="'/problem/show/' + id"/>
            </v-toolbar-items>
          </v-toolbar>
          <v-progress-linear indeterminate query v-if="loading" />
          <v-card-text v-show="view === 0">
            <v-text-field :label="$t('title')" v-model="problem.title" />
            <z-markdown-editor v-model="problem.content" />
            <v-combobox v-model="problem.tags" :label="$t('tags')" hide-selected multiple chips clearable/>
          </v-card-text>
          <v-card-text v-show="view === 1">
            <v-text-field :label="$t('channel')" v-model="problem.channel" />
            <data-edit v-model="problem.data" :channel="problem.channel"/>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-dialog v-model="showImport" width="500">
      <v-card>
        <v-card-title class="headline" v-text="$t('import')"/>
        <v-card-text>
          <v-textarea v-model="importText" :placeholder="$t('problem_import_tip')"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn v-text="$t('cancel')" @click="showImport = 0"/>
          <v-btn color="primary" v-text="$t('apply')" @click="doImport"/>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import zMarkdownEditor from '@/components/zmarkdowneditor.vue'
import dataEdit from '@/components/dataedit.vue'
import { request } from '@/http'
import { convertBZOJ, convertPOJ } from '@/helper/importprob'

export default {
  name: 'ProblemEdit',
  components: {
    zMarkdownEditor,
    dataEdit
  },
  props: ['id'],
  data () {
    return {
      problem: {
        id: null,
        title: 'New problem',
        content: '',
        data: {},
        channel: null,
        tags: ['Untagged'],
        updated: null,
        owner: null,
        creator: null
      },
      loading: true,
      view: 0,
      isnew: false,
      showImport: false,
      canImport: false,
      importText: ''
    }
  },
  async mounted () {
    if (this.id) {
      this.load()
    } else {
      this.isnew = true
      this.loading = false
    }
  },
  watch: {
    'problem.channel': function (val) {
      if (['bzoj', 'poj', 'hdu', 'uoj', 'loj'].includes(val)) {
        this.canImport = true
      } else {
        this.canImport = false
      }
    }
  },
  methods: {
    async save () {
      this.loading = true
      if (this.isnew) {
        request({
          url: '/api/problem',
          params: { entry: this.$store.state.entry },
          method: 'POST',
          data: this.problem
        })
          .then(id => {
            this.$router.push('/problem/show/' + id)
          })
          .catch(e => {
            this.$store.commit('updateMessage', e.message)
          })
          .finally(() => {
            this.loading = false
          })
      } else {
        request({
          url: '/api/problem',
          params: { entry: this.$store.state.entry, id: this.id },
          method: 'PUT',
          data: this.problem
        })
          .catch(e => {
            this.$store.commit('updateMessage', e.message)
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    remove () {
      this.loading = true
      request({
        url: '/api/problem',
        params: { entry: this.$store.state.entry, id: this.id },
        method: 'DELETE'
      })
        .catch(e => {
          this.$store.commit('updateMessage', e.message)
        })
        .finally(() => {
          this.$router.push('/problem')
          this.loading = false
        })
    },
    load () {
      request({
        url: '/api/problem',
        params: { entry: this.$store.state.entry, id: this.id }
      })
        .then(problem => {
          this.problem = problem
        })
        .catch(e => {
          this.$store.commit('updateMessage', e.message)
        })
        .finally(() => {
          this.loading = false
        })
    },
    doImport () {
      switch (this.problem.channel) {
        case 'bzoj':
          {
            const { id, title, content } = convertBZOJ(this.importText)
            this.problem.title = title
            this.problem.content = content
            this.problem.data = { id }
            this.problem.tags = ['BZOJ']
          }
          break
        case 'poj':
          {
            const { title, content } = convertPOJ(this.importText)
            this.problem.title = title
            this.problem.content = content
            this.problem.tags = ['POJ']
          }
          break
        default:
          this.$store.commit('updateMessage', this.$t('not_supported'))
      }
      this.showImport = false
    }
  }
}
</script>

<style lang="stylus" scoped>
.fill
  height 100%
  overflow hidden
</style>
