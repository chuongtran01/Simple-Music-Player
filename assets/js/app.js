const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "F8-PLAYER"

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const inActiveSong = $('.song active')
const activeSong = $$('.song')
const playlist = $('.playlist') 

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: 'Sau tat ca',
            singer: 'Erik',
            path: './assets/music/sautatca.mp3',
            image: './assets/img/sautatca.jfif'
        },
        {
            name: 'Thuc giac',
            singer: 'Da Lab',
            path: './assets/music/thucgiac.mp3',
            image: './assets/img/thucgiacc.jfif'
        },
        {
            name: 'Nam lay doi ban tay',
            singer: 'Kay Tran',
            path: './assets/music/namlaydoibantay.mp3',
            image: './assets/img/namlaydoibantay.webp'
        },
        {
            name: 'Co hen voi thanh xuan',
            singer: 'Monstar',
            path: './assets/music/cohenvoithanhxuan.mp3',
            image: './assets/img/cohenvoithanhxuan.jpg'
        },
    ],

    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const htmls = this.songs.map((song,index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" 
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('\n')
    },

    definePropeties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    }, 

    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xu ly CD quay / dung
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xu ly phong to hoac thu nho CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth/cdWidth
        }

        // Xu ly khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }
        }

        // Khi song dc played
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song dc paused
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tien do bai hat thay doi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xu ly khi tua song
        progress.oninput = function(e) {
            const seekTime = e.target.value * audio.duration / 100
            audio.currentTime = seekTime
            audio.play()
        }

        // Khi next bai hat
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev bai hat
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()

        }

        // Xu ly random bat/tat
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xu ly lap lai mot song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xu ly next song khi audio ends
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            }
            else {
                nextBtn.click()
            }
        }

        //Lang nghe hanh vi click vao playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // Xu ly khi click vao song    
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // Xu ly khi click vao option    
                if (e.target.closest('.option')) {

                }
            }
        }
    },
            
    scrollToActiveSong: function() {
        setTimeout(() => {
            if (this.currentIndex <= 2) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
            })
        }
            else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
            })
        }
        },300)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name + " - " + this.currentSong.singer 
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

        //  if (inActiveSong) {
        //      inActiveSong.classList.remove('active')
        // }
        //  activeSong[this.currentIndex].classList.add('active')
    },
    
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function() {
        this.arrOldIndexes = []
        let newIndex
        this.arrOldIndexes.push(this.currentIndex)
        if (this.arrOldIndexes.length === this.songs.length) {
            this.arrOldIndexes = [];
        }
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } 
        while (this.arrOldIndexes.includes(newIndex))

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function() {
        //Gan cau hinh tu config vao object
        this.loadConfig()
        // Dinh nghia cac thuoc tinh cho object 
        this.definePropeties()

        // Lang nghe va xu ly cac su kien (DOM events)
        this.handleEvents()

        // Tai thong tin bai hat dau tien vao UI khi chay ung dung
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hien thi trang thai ban dau cua button repeat va random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    }
}

app.start()
    
