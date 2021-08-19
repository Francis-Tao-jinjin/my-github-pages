import '../styles/global.css'
import 'tailwindcss/dist/base.css';
import 'tailwindcss/dist/components.css';
import 'tailwindcss/dist/utilities.css';
import 'highlight.js/styles/atom-one-light.css';
import { useEffect } from 'react';
import { loadTextures } from '../components/webgl/index';

export default function App({Component, pageProps}) {

    useEffect(() => {
        window.onload = () => {
            loadTextures();
        }
        return () => {
            console.log('App destory');
        }
    }, []);

    return <div>
        <Component {...pageProps}/>
        <canvas id="glcanvas" width="1" height="1">
            Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
        </canvas>
    </div>;
}