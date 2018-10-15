;(function(Vue) {
  let vm = new Vue({
    el: '#app',
    data: {
      editRawData: false,
      textures: 1,
      vid: '',
      settings: {
        fadeMs: 0,
        main: {
          extension: 'model.json'
        },
        model: {
          extension: 'moc'
        },
        motions: {
          extension: 'mtn',
          taps: ['attack', 'hit'],
          idle: 'idle'
        },
        sounds: {
          extension: 'ogg',
          attack: [
            'skill',
            'ctskill',
            'prskill',
            'drive',
            'boss_long',
            'boss_short',
            'startbt',
            'victory'
          ],
          hit: ['death_1', 'death_2', 'hit_1', 'hit_2', 'hit_3']
        }
      },
      dbRawData: ''
    },
    computed: {
      dbRows() {
        return this.dbRawData.split('\n')
      },
      db() {
        let data = []
        this.dbRows.forEach(rowData => {
          let colData = rowData.split('\t')

          if (colData) {
            let vid = colData[0] || ''
            let name = colData[1] || ''
            let description = colData[2] || ''

            data.push({
              vid: vid,
              name: name.replace('_', ' '),
              description: description
            })
          }
        })
        return data
      },
      vidMatches() {
        return this.db.filter(data => {
          return data.vid.indexOf(this.vid) >= 0
        })
      },
      vidInfo() {
        if (!this.vid) return ''

        return this.vidMatches.map(data => {
          return { vid: data.vid, name: data.name }
        })
      },
      isOutput() {
        return (
          this.vid &&
          this.vidMatches.length === 1 &&
          this.vidMatches[0].vid === this.vid
        )
      },
      outputContent() {
        let fadeMs = this.settings.fadeMs || 0
        let data = {
          version: 'Sample 1.0.0',
          model: '',
          textures: [],
          motions: {
            tap: [],
            idle: []
          },
          physics: ''
        }

        // model
        data.model = `${this.vid}.${this.settings.model.extension}`

        // textures
        for (let i = 0; i < this.textures; i++) {
          numberText = this.numberToText(i, 2)
          data.textures.push(`texture_${numberText}.png`)
        }

        // motions
        let motionExtension = this.settings.motions.extension

        // idle motion
        let idleSubName = this.settings.motions.idle
        let idleFileName = this.motionFileName(
          this.vid,
          idleSubName,
          motionExtension
        )
        data.motions.idle.push({
          file: idleFileName,
          fade_in: fadeMs,
          fade_out: fadeMs
        })

        // tap motions
        let taps = this.settings.motions.taps
        taps.forEach(tap => {
          let soundExtension = this.settings.sounds.extension
          let tapSounds = this.settings.sounds[tap]

          let tapFileName = this.motionFileName(this.vid, tap, motionExtension)

          tapSounds.forEach(soundName => {
            let vid = this.vid.replace(/_\w+/, '')
            let tapSoundName = this.motionFileName(
              vid,
              soundName,
              soundExtension
            )
            data.motions.tap.push({
              file: tapFileName,
              sound: tapSoundName,
              fade_in: fadeMs,
              fade_out: fadeMs
            })
          })
        })

        return data
      }
    },
    watch: {
      dbRawData() {
        if (typeof Storage !== undefined) {
          localStorage.setItem('rawData', this.dbRawData)
        }
      }
    },
    methods: {
      numberToText(number, minLength = 1) {
        let text = String(number)
        let textLength = text.length

        let result = text

        if (textLength < minLength) {
          for (let i = 0; i < minLength - textLength; i++) {
            result = '0' + result
          }
        }

        return result
      },
      motionFileName(name, subName, extension) {
        return `${name}_${subName}.${extension}`
      }
    },
    created() {
      if (typeof Storage !== undefined) {
        rawData = localStorage.getItem('rawData')
        this.dbRawData = rawData || ''
      }
    }
  })
})(Vue)
