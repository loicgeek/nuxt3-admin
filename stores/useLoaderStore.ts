const useLoadingIndicator = (opts: {
    duration: number,
    throttle: number
}) => {
    const progress = ref(0)
    const isLoading = ref(false)
    const step = computed(() => 10000 / opts.duration)

    let _timer: any = null
    let _throttle: any = null

    function start () {
        clear()
        progress.value = 0
        if (opts.throttle && process.client) {
            _throttle = setTimeout(() => {
                isLoading.value = true
                _startTimer()
            }, opts.throttle)
        } else {
            isLoading.value = true
            _startTimer()
        }
    }
    function finish () {
        progress.value = 100
        _hide()
    }

    function clear () {
        clearInterval(_timer)
        clearTimeout(_throttle)
        _timer = null
        _throttle = null
    }

    function _increase (num: number) {
        progress.value = Math.min(100, progress.value + num)
    }

    function _hide () {
        clear()
        if (process.client) {
            setTimeout(() => {
                isLoading.value = false
                setTimeout(() => { progress.value = 0 }, 400)
            }, 500)
        }
    }

    function _startTimer () {
        if (process.client) {
            _timer = setInterval(() => { _increase(step.value) }, 100)
        }
    }

    return {
        progress,
        isLoading,
        start,
        finish,
        clear
    }
}
export const useLoaderStore = defineStore('useLoaderStore',
    {
        state () {
            return {
                indicator: useLoadingIndicator({
                    duration: 2000,
                    throttle: 200
                })
            }
        },
        actions: {
            start () {
                this.indicator.start()
            },
            finish () {
                this.indicator.finish()
            },
            clear () {
                this.indicator.clear()
            }
        }
    })

    export const useFullLoaderStore = defineStore('useLoaderStore',
    {
        state () {
            return {
                indicator: useLoadingIndicator({
                    duration: 2000,
                    throttle: 200
                })
            }
        },
        actions: {
            start () {
                this.indicator.start()
            },
            finish () {
                this.indicator.finish()
            },
            clear () {
                this.indicator.clear()
            }
        }
    })
