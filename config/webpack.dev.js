const path = require("path");
const uglify = require('uglifyjs-webpack-plugin');
const htmlPlugin = require('html-webpack-plugin');
const extractTextPlugin = require('extract-text-webpack-plugin');
const glob = require('glob');
const PurifyCSSPlugin = require("purifycss-webpack");

var website ={
    publicPath:"http://localhost:8888/"
}

module.exports = {
    mode : 'development',
    entry : {
        main : './src/main.js',
        main2 : './src/main2.js'
    },
    output : {
        path : path.resolve(__dirname, '../dist'),
        filename : 'js/[name].js',
        publicPath:website.publicPath  //publicPath：主要作用就是处理静态文件路径的。
    },
    module : {
        rules : [
            {
                test : /\.css/,
                use : extractTextPlugin.extract({
                    fallback: "style-loader",
                    use:[
                        {loader:"css-loader"},
                        {loader:"postcss-loader"}
                    ]
                }),
            },{
                test:/\.(png|jpg|gif|jpeg)/,  //是匹配图片文件后缀名称
                use:[{
                    loader:'url-loader', //是指定使用的loader和loader的配置参数
                    options:{
                        limit:500, //是把小于500B的文件打成Base64的格式，写入JS
                        outputPath:'images/'  //打包后的图片放到images文件夹下
                    }
                }]
            },{
                test: /\.(htm|html)$/i,
                use:[ 'html-withimg-loader'] 
            },{
                test: /\.less$/,
                use: extractTextPlugin.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "less-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },{
                test: /\.scss$/,
                use: extractTextPlugin.extract({
                    use: [
                        {loader: "css-loader"},
                        {loader: "sass-loader"}
                    ],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },{
                test:/\.(jsx|js)$/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:[
                           "es2015","react"
                        ]
                    }
                },
                exclude:/node_modules/
            }
        ]
    },

    plugins : [
        new uglify(),
        new htmlPlugin({
            minify:{ //是对html文件进行压缩
                removeAttributeQuotes:true  //removeAttrubuteQuotes是却掉属性的双引号。
            },
            hash:true, //为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
            template:'./src/index.html' //是要打包的html模版路径和文件名称。
           
        }),
        new extractTextPlugin("css/index.css"), //这里的/css/index.css 是分离后的路径
        new PurifyCSSPlugin({
            //这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了。
            paths: glob.sync(path.join(__dirname, '../src/*.html')),
        })
    ],

    devServer:{
            //设置基本目录结构,用于找到程序打包地址
            contentBase:path.resolve(__dirname,'../dist'),
            //服务器的IP地址，可以使用IP也可以使用localhost
            host:'localhost',
            //服务端压缩是否开启
            compress:true,
            //配置服务端口号
            port:8888
    }
}