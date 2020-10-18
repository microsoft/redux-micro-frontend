module.exports = function (config) {
    config.set({
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            { pattern: "src/**/*.ts" },
            { pattern: "test/**/*.ts" }
        ],
        preprocessors: {
            "src/**/*.ts": ["karma-typescript"],
            "test/**/*.ts": "karma-typescript"
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["Chrome"],
        karmaTypescriptConfig: {
            coverageReporter: {
                instrumenterOptions: {
                    istanbul: { noCompact: true }
                }
            },
            bundlerOptions: {
                transforms: [
                    require("karma-typescript-es6-transform")({
                        presets: [
                            ["env", {
                                targets: {
                                    chrome: "60"
                                }
                            }]
                        ]
                    })
                ]
            },
            compilerOptions: {
                module: "commonjs",
                sourceMap: true,
                target: "es6",
                allowJs: false,
                declaration: true,
                moduleResolution: "node",
                skipLibCheck: true,
                lib: ["es2017", "DOM"],
                downlevelIteration: true
            },
            typeRoots: [
                "node_modules/@types"
            ],
            exclude: [
                "node_modules/**/*"
            ]
        },
        plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-typescript']
    });
};