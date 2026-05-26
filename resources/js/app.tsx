import { customElement, noShadowDOM } from 'solid-element'
import { ConfigPage } from './components/ConfigPage'

const withoutShadow = (Component: any) => {
  return (props: any) => {
    noShadowDOM()
    return <Component {...props} />
  }
}

customElement('config-page', {}, withoutShadow(ConfigPage))
