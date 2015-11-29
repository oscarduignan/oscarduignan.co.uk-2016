import $ from 'jquery';

$('h1').text('Hello, World!');

if (module.hot) {
    // enables HMR, see http://webpack.github.io/docs/hot-module-replacement.html
    module.hot.accept();
}