import CopyWebpackPlugin from 'copy-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import webpack from 'webpack'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

type WebpackConfig = webpack.Configuration & { devServer?: DevServerConfiguration }


export default (_: any, options: any): WebpackConfig => {
    const host = process.env.HOST ?? '0.0.0.0'
    const port = parseInt(process.env.PORT ?? '3000', 10)
    const showErrors = process.env.ERRORS

    const isProduction = options.mode === 'production'
    const isDevelopment = options.mode === 'development'

    const config: WebpackConfig = {}

    /*
     * -------------------------------------------------------------
     * Entry points
     * -------------------------------------------------------------
     */

    config.entry = {
        index: path.resolve(__dirname, 'src/index'),
    }

    /*
     * -------------------------------------------------------------
     * Output
     * -------------------------------------------------------------
     */

    config.output = {
        assetModuleFilename: 'assets/[hash][ext]',
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name]-[contenthash:6].js',
        publicPath: '/',
        clean: true,
    }

    if (isDevelopment) {
        config.output.pathinfo = false
    }

    /*
     * -------------------------------------------------------------
     * Optimization
     * -------------------------------------------------------------
     */

    config.optimization = isDevelopment ? {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        runtimeChunk: true,
        splitChunks: false,
    } : {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    chunks: 'all',
                    name: 'vendors',
                    test: /(?<!node_modules.*)[\\/]node_modules[\\/]/,
                    priority: 40,
                    enforce: true,
                },
                common: {
                    name: 'commons',
                    test: /(common|layout|hooks|misc)/,
                    minChunks: 1,
                    priority: 30,
                    reuseExistingChunk: true,
                },
                default: false,
                vendors: false,
            },
            maxInitialRequests: 10,
            minSize: 30000,
        },
    }

    /*
     * -------------------------------------------------------------
     * Plugins
     * -------------------------------------------------------------
     */

    config.plugins = []

    if (isDevelopment && showErrors) {
        config.plugins.push(new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: path.resolve('tsconfig.json')
            }
        }))
    }

    config.plugins.push(
        new HtmlWebpackPlugin({
            title: 'DEX, Liquidity Pools, Farming and Vesting | FlatQube',
            favicon: 'public/favicon.svg',
            filename: path.resolve(__dirname, 'dist/index.html'),
            template: 'public/index.html',
            inject: false,
        }),
    )

    if (isProduction) {
        config.plugins.push(
            new MiniCssExtractPlugin({
                filename: 'css/[name]-[contenthash:6].css',
                ignoreOrder: true,
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        context: 'public',
                        from: 'favicon.{ico,svg}',
                    },
                    {
                        context: 'public',
                        from: 'assets',
                        to: 'assets',
                    },
                ],
            }),
        )
    }

    /*
     * -------------------------------------------------------------
     * Module
     * -------------------------------------------------------------
     */

    config.module = {
        rules: [
            {
                exclude: [/node_modules/],
                test: /\.([jt]sx?)?$/,
                use: isProduction ? 'babel-loader' : 'swc-loader',
            },
            {
                // exclude: /react-uikit/gi,
                test: /\.s[ac]ss$/,
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            esModule: true,
                            modules: {
                                auto: true,
                                localIdentName: isProduction ? 'css-[hash:base64:8]' : '[path][name]__[local]--[hash:base64:8]',
                                namedExport: false,
                            },
                            url: {
                                filter: (url: string) => !/^\/assets\//.test(url),
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            // additionalData: [
                            //     '@import \'@/app/styles/resources/variables.scss\';',
                            //     '@import \'@/app/styles/resources/mixins.scss\';',
                            // ].join('\n'),
                            implementation: require.resolve('sass'),
                            sassOptions: {
                                quietDeps: true,
                            },
                        },
                    },
                ],
            },
            // Since sass-loader@16.0.0
            {
                test: /\.css$/,
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            esModule: true,
                            url: {
                                filter: (url: string) => !/^\/assets\//.test(url),
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|webp|svg|woff2?)$/,
                type: 'asset/resource',
            },
        ],
    }

    /*
     * -------------------------------------------------------------
     * Resolve
     * -------------------------------------------------------------
     */

    config.resolve = {
        alias: {
            '@': path.resolve(__dirname, 'src')
        },

        extensions: ['.js', '.ts', '.tsx', '.scss', '.css'],

        fallback: {
            buffer: require.resolve('buffer'),
        },

        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules',
        ],

        symlinks: false,
    }

    /*
     * -------------------------------------------------------------
     * Devtool
     * -------------------------------------------------------------
     */

    if (isDevelopment) {
        config.devtool = 'eval-source-map'
    }

    /*
     * -------------------------------------------------------------
     * Dev Server
     * -------------------------------------------------------------
     */

    if (isDevelopment) {
        config.devServer = {
            host,
            port,
            historyApiFallback: true,
            liveReload: false,
            hot: false,
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
                reconnect: 10,
            },
        }
    }

    /*
     * -------------------------------------------------------------
     * Watch
     * -------------------------------------------------------------
     */

    if (isDevelopment) {
        config.watchOptions = {
            aggregateTimeout: 500,
            ignored: /node_modules/,
            poll: 180,
        }
    }

    /*
     * -------------------------------------------------------------
     * Stats
     * -------------------------------------------------------------
     */

    config.stats = 'errors-warnings'

    return config
}
