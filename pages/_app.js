import '../styles/global.css'
import 'tailwindcss/dist/base.css';
import 'tailwindcss/dist/components.css';
import 'tailwindcss/dist/utilities.css';
// import '../styles/tailwind.css';
import 'highlight.js/styles/atom-one-light.css';

export default function App({Component, pageProps}) {
    return <Component {...pageProps}/>
}