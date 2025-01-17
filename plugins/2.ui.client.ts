
import { createToaster } from '@meforma/vue-toaster'
import  { DateTime } from 'ts-luxon'

export default defineNuxtPlugin(() => {
    const toast = createToaster({
        position: 'top'
    })
    // const grid = useGrid('tailwind')
    // const locale = useNuxtApp().$i18n.locale.value

    const ui = {
        startLoader () {
            const loader = useLoaderStore()
            loader.start()
        },
        endLoader () {
            const loader = useLoaderStore()
            loader.finish()
        },
        success: (message:string, options?:{
            'onClick'?:Function
        }) => {
            toast.success(message, { ...options })
        },
        error: (message:string, options?:Record<string, any>) => {
            toast.error(message, { ...options })
        },
        warning: (message:string, options?:Record<string, any>) => {
            toast.warning(message, { ...options })
        },
        info: (message:string, options?:Record<string, any>) => {
            toast.info(message, { ...options })
        },
        getMediaUrl (mediaId:string, thumbnail = true) {
            const config = useRuntimeConfig()
            const originBaseUrl = config.public.isDev? 'https://api.dev.chairwatch.com':'https://api.chairwatch.com';
            
            if (thumbnail) {
                return `${originBaseUrl}/media/v1/images/${mediaId}/download?quality=thumbnail`
            } else {
               return `${originBaseUrl}/media/v1/images/${mediaId}/download`
            }
        },
        getStoreUrl (slug:string) {
            const config = useRuntimeConfig()
            return  config.public.isDev? `https://${slug}.dev.chairwatch.com`:`https://${slug}.chairwatch.com`;

        },
        getDaySuffix(day:number, locale = 'en') {
            if (locale === 'en') {
              if (day >= 11 && day <= 13) return 'th'; // Handle special cases
              switch (day % 10) {
                case 1:
                  return 'st';
                case 2:
                  return 'nd';
                case 3:
                  return 'rd';
                default:
                  return 'th';
              }
            }
            // Default to no suffix for other locales
            return '';
          },
      
          formatDateWithSuffix(date:DateTime, locale = 'en') {
            const day = date.day;
            const suffix = this.getDaySuffix(day, locale);
            const formatter = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' });
            
            const monthAndYear = formatter.format(date.toJSDate());
           
            
            return `${monthAndYear.split(' ')[0]} ${day}${suffix}, ${monthAndYear.split(' ')[1]}`;
          },
      
          formatDateRange(dateString:string, locale = 'en') {
           try {
            if(dateString.length==0) return ''
            
            const date = DateTime.fromJSDate(new Date(Date.parse(dateString)));

            
            return this.formatDateWithSuffix(date, locale);
           } catch (error) {
           // console.log(error,dateString);
            
            return ''
           }
          },
          formatJsDate(date:Date,locale:string) {
             return date.toLocaleString([locale],{year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'})
          },
        capitalize (value:string) {
            if (!value) { return '' }
            return value.charAt(0).toUpperCase() + value.slice(1)
        },
        getColorByStoreStatus(status:string) {
            switch (status) {
                case 'onboarding':
                    return '#0000FF'
                case 'prelaunch':
                    return '#A020F0'
                case 'launching':
                    return '#00ff00'
                case 'running':
                    return '#000000'
                case 'inactive':
                    return '#FFA500'
                case 'closed':
                    return '#FF0000'
                case 'abandoned':
                    return '#808080'
                default:
                    return 'blue'
            }
        }
    }
    return {
        provide: {
            ui
        }
    }
})