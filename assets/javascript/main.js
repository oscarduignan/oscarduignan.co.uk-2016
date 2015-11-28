console.log('Hello, World!');

if (module.hot) {
    // enables HMR, see http://webpack.github.io/docs/hot-module-replacement.html
    module.hot.accept();
}