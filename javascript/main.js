import $ from 'jquery';

console.log('hello world!');

if (module.hot) {
    // enables HMR, see http://webpack.github.io/docs/hot-module-replacement.html
    module.hot.accept();
}
