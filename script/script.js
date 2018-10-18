;(function(Vue) {
  let vm = new Vue({
    el: '#app',
    data: {
      editRefData: false,
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
      refPck: '',
      refSoundText: ''
    },
    computed: {
      pckData() {
        return this.refPck.split('\n')
      },
      pckList() {
        return this.parseRefDataList(this.pckData, [
          'vid',
          'name',
          'description'
        ])
      },
      soundTextData() {
        return this.refSoundText.split('\n')
      },
      soundTextMap() {
        return this.parseRefDataMap(this.soundTextData)
      },
      vidMatches() {
        return this.pckList.filter(data => {
          return data.vid.indexOf(this.vid) >= 0
        })
      },
      vidInfo() {
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
        let fileExtension = ''

        // model
        fileExtension = this.settings.model.extension
        data.model = `${this.vid}.${fileExtension}`

        // textures
        fileExtension = 'png'
        for (let i = 0; i < this.textures; i++) {
          numberText = this.numberToText(i, 2)
          data.textures.push(`texture_${numberText}.${fileExtension}`)
        }

        // motions
        fileExtension = this.settings.motions.extension

        // idle motion
        let idleName = this.settings.motions.idle
        let idleFileName = `${this.vid}_${idleName}.${fileExtension}`
        data.motions.idle.push({
          file: idleFileName,
          fade_in: fadeMs,
          fade_out: fadeMs
        })

        // tap motion
        let taps = this.settings.motions.taps
        taps.forEach(tapName => {
          let soundExtension = this.settings.sounds.extension
          let sounds = this.settings.sounds[tapName]
          let tapFileName = `${this.vid}_${tapName}.${fileExtension}`

          sounds.forEach(soundName => {
            let vid = this.vid.replace(/_\w+/, '')
            let tapSoundName = `${vid}_${soundName}`
            let tapSoundFile = `${tapSoundName}.${soundExtension}`

            data.motions.tap.push({
              file: tapFileName,
              sound: tapSoundFile,
              text: this.soundTextMap[tapSoundName],
              fade_in: fadeMs,
              fade_out: fadeMs
            })
          })
        })

        return data
      }
    },
    watch: {
      refPck() {
        this.saveLocalStorage('refPck', this.refPck)
      },
      refSoundText() {
        this.saveLocalStorage('refSoundText', this.refSoundText)
      }
    },
    methods: {
      parseRefDataList(refData, columnNames) {
        let data = []

        refData.forEach(rowData => {
          let colData = rowData.split('\t')

          if (colData && colData.length === columnNames.length) {
            let refObj = {}

            for (let i = 0; i < columnNames.length; i++) {
              refObj[columnNames[i]] = colData[i]
            }

            data.push(refObj)
          }
        })

        return data
      },
      parseRefDataMap(refData) {
        let data = {}

        refData.forEach(rowData => {
          let colData = rowData.split('\t')

          if (colData && colData.length === 2) {
            data[colData[0]] = colData[1]
          }
        })

        return data
      },
      saveLocalStorage(itemKey, data) {
        if (typeof Storage !== undefined && itemKey && data) {
          localStorage.setItem(itemKey, data)
        }
      },
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
      }
    },
    filters: {
      nameFormat(name) {
        return name.replace('_', '')
      }
    },
    created() {
      if (typeof Storage !== undefined) {
        this.refPck = localStorage.getItem('refPck') || ''
        this.refSoundText = localStorage.getItem('refSoundText') || ''
      }
    }
  })
})(Vue)
