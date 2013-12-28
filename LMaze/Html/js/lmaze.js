/*jslint browser: true */
(function (exports) {
    "use strict";

    var namespace = window.lmaze = {},
        GAME_OVER = 0,
        GAME_RUNNING = 1;

    /**
     * The start tile.
     */
    function StartTile(model, pos, exit) {
        // the position vector.
        this.pos = pos;
        // the exit number.
        this.exit = exit;
        // the maze model.
        this.model = model;
    }

    namespace.StartTile = StartTile;

    /**
     * The block tile.
     */
    function BlockTile(pos) {
        this.pos = pos;
    }

    namespace.BlockTile = BlockTile;

    function randomPath() {
        var exits = [0, 1, 2, 3, 4, 5, 6, 7],
            swap = function (arr, i, j) {
                var t = arr[i];
                arr[i] = arr[j];
                arr[j] = t;
            },
            paths = [],
            i;
        for (i = 0; i < exits.length; i += 1) {
            swap(exits, parseInt(Math.random() * exits.length, 10), parseInt(Math.random() * exits.length, 10));
        }

        for (i = 0; i < exits.length / 2; i += 1) {
            paths.push([(exits[i * 2] || 0), (exits[i * 2 + 1] || 0), false]);
        }

        return paths;
    }

    /**
     * The regular tile class.
     *
     */
    function MazeTile(pos) {
        // the rotation for inner use.
        this.mRotation = 0;
        // the path is a collection of vector (two point node and a selected flag).
        this.mPaths = randomPath();
        // the public position.
        this.pos = pos;
    }

    MazeTile.prototype = {

        /**
         * Rotate the tile once per call.
         */
        rotate: function () {
            this.mRotation = (this.mRotation + 90) % 360;
        },

        /**
         * Access the path of the given entrance.
         *
         * @param entrance the entrance handle.
         */
        access: function (entrance) {
            var i, d, p = 8;

            d = this.mRotation / 45;
            entrance = (entrance - d + p) % p;

            for (i = 0; i < this.mPaths.length; i += 1) {
                if (this.mPaths[i][0] === entrance) {
                    this.mPaths[i][2] = true;
                    return (this.mPaths[i][1] + d + p) % p;
                }
                if (this.mPaths[i][1] === entrance) {
                    this.mPaths[i][2] = true;
                    return (this.mPaths[i][0] + d + p) % p;
                }
            }
        }
    };

    namespace.MazeTile = MazeTile;

    /**
     * The model of the maze.
     */
    function MazeModel(callback) {
        // the internal state.
        this.mState = 0;
        // the current tile.
        this.mTile = null;
        // the tiles.
        this.mTiles = [];
        // last exit.
        this.mExit = 7;
        // the callback
        this.mCallback = callback || function () {};
    }

    function getConnectedEntrance(exit) {
        switch (exit) {
        case 0:
            return 5;
        case 1:
            return 4;
        case 2:
            return 7;
        case 3:
            return 6;
        case 4:
            return 1;
        case 5:
            return 0;
        case 6:
            return 3;
        case 7:
            return 2;
        }
    }

    function getNextPosition(exit) {
        switch (exit) {
        case 0:
        case 1:
            return [0, -1];
        case 2:
        case 3:
            return [1, 0];
        case 4:
        case 5:
            return [0, 1];
        case 6:
        case 7:
            return [-1, 0];
        }
    }



    MazeModel.prototype = {

        /**
         * Add the tile to current model and set it as current.
         */
        addTile: function (tile) {
            this.mTiles.push(tile);
            this.mTile = tile;
        },

        /**
         * Initialization of the model.
         */
        init: function () {
            var i;

            for (i = 1; i < 9; i += 1) {
                this.addTile(new BlockTile([i, 0]));
                this.addTile(new BlockTile([0, i]));
                this.addTile(new BlockTile([i, 9]));
                this.addTile(new BlockTile([9, i]));
            }

            this.addTile(new StartTile(this, [5, 5], this.mExit = 7));
            this.addTile(new MazeTile([4, 5]));

            this.mState = 1;

            this.mCallback({
                type: 'init'
            });
        },

        /**
         * Rotate the tile.
         */
        rotate: function () {
            if (this.mTile && this.mTile.rotate) {
                this.mTile.rotate();

                this.mCallback({
                    type: 'rotate',
                    target: this.mTile
                });
            }
        },

        /**
         * Get the tile at given position.
         *
         * @return the MazeTile object.
         */
        getTile: function (pos) {
            var i;
            for (i = 0; i < this.mTiles.length; i += 1) {
                if (this.mTiles[i].pos[0] === pos[0] && this.mTiles[i].pos[1] === pos[1]) {
                    return this.mTiles[i];
                }
            }
        },

        /**
         * Move forward along the path.
         *
         * @param step optional.
         */
        step: function (step) {
            var exit, pos, tilePos, tile;
            if (!this.mTile.access) {
				this.state = 0;

                this.mCallback({
                    type: 'over'
                });
                return;
            }
            exit = this.mTile.access(getConnectedEntrance(this.mExit));
            pos = getNextPosition(exit);
            tilePos = [this.mTile.pos[0] + pos[0], this.mTile.pos[1] + pos[1]];
            tile = this.getTile(tilePos);
            this.mExit = exit;

            if (tile) {
                this.mTile = tile;
                this.mCallback({
                    type: 'step',
                    step: step
                });
                this.step(step + 1);
            } else {
                this.addTile(new MazeTile(tilePos));
                this.mCallback({
                    type: 'step',
                    step: step
                });
            }
        }
    };

    namespace.MazeModel = MazeModel;

}(window));