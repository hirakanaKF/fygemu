/*
Project: fygemu
Authors: hirakana@kf
*/

// Setup
(globalThis.window ? (window.Engine ??= {}) : exports).constructor = function () {

    // SHA3 (a.k.a. Keccak)
    class SHA3 {
        T = new TextEncoder();
        C = new BigUint64Array(5);
        D = new BigUint64Array(5);
        N = new BigUint64Array(25);
        RC = [
            0x1n, 0x8082n, 0x808an, 0x80008000n, 0x808bn,
            0x80000001n, 0x80008081n, 0x8009n, 0x8an, 0x88n,
            0x80008009n, 0x8000000an, 0x8000808bn, 0x8bn, 0x8089n,
            0x8003n, 0x8002n, 0x80n, 0x800an, 0x8000000an,
            0x80008081n, 0x8080n
        ];
        RR = [0n, 1n, 30n, 28n, 27n, 4n, 12n, 6n, 23n, 20n, 3n, 10n, 11n, 25n, 7n, 9n, 13n, 15n, 21n, 8n, 18n, 2n, 29n, 24n, 14n];
        RP = [0n, 10n, 20n, 5n, 15n, 16n, 1n, 11n, 21n, 6n, 7n, 17n, 2n, 12n, 22n, 23n, 8n, 18n, 3n, 13n, 14n, 24n, 9n, 19n, 4n];
        mState = new BigUint64Array(25);

        rol32 = (s, n) => (s << n) | (s >> (32n - n)) & 0xffffffffn;

        calc (s) {
            const
                A = this.T.encode(s), n = A.byteLength,
                B = this.mState, C = this.C, D = this.D, N = this.N, RC = this.RC, RR = this.RR, RP = this.RP,
                rol32 = this.rol32, I1 = [1, 2, 3, 4, 0], I2 = [2, 3, 4, 0, 1], I4 = [4, 0, 1, 2, 3]
            ;
            let i, x, y, z;
            for (i = 0; i < n; i += 8) {
                for (x = 0; x < 8; x++) {
                    y = i + x << 2;
                    B[x] ^= BigInt((A[y] || 0) | ((A[y + 1] || 0) << 8) | ((A[y + 2] || 0) << 16) | ((A[y + 3] || 0) << 24)); // Lazy padding
                }
                for (y = 0; y < 22; y++) {
                    for (x = 0; x < 5; x++) {
                        C[x] = B[x] ^ B[x + 5] ^ B[x + 10] ^ B[x + 15] ^ B[x + 20]; 
                    }
                    for (x = 0; x < 5; x++) {
                        D[x] = C[I4[x]] ^ rol32(C[I1[x]], 1n);
                    }
                    for (x = 0; x < 25; x += 5) {
                        for (z = 0; z < 5; z++) {
                            const xz = x + z;
                            N[RP[xz]] = rol32(B[xz] ^ D[z], RR[xz]);
                        }
                    }
                    for (x = 0; x < 5; x++) {
                        for (z = 0; z < 25; z += 5) {
                            B[z + x] = N[z + x] ^ ((~N[z + I1[x]]) & (N[z + I2[x]]));
                        }
                    }
                    B[0] ^= RC[y];
                }
            }

            return this;
        }

        digest () {
            const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", B = this.mState, R = Array(128);
            let i, n = 0;
            for (i = 0; i < 8; i++) {
                const w0 = B[i], w1 = B[i + 8], w2 = B[i + 16];
                R[n++] = A[w0 & 63n]; R[n++] = A[w0 >> 6n & 63n]; R[n++] = A[w0 >> 12n & 63n]; R[n++] = A[w0 >> 18n & 63n]; R[n++] = A[w0 >> 24n & 63n];
                R[n++] = A[w1 & 63n]; R[n++] = A[w1 >> 6n & 63n]; R[n++] = A[w1 >> 12n & 63n]; R[n++] = A[w1 >> 18n & 63n]; R[n++] = A[w1 >> 24n & 63n];
                R[n++] = A[w2 & 63n]; R[n++] = A[w2 >> 6n & 63n]; R[n++] = A[w2 >> 12n & 63n]; R[n++] = A[w2 >> 18n & 63n]; R[n++] = A[w2 >> 24n & 63n];
                R[n++] = A[(w0 >> 30n) | (w1 >> 30n << 2n) | (w2 >> 30n << 4n) & 63n];
            }
            return R.join("");
        }
    }

    // Mersenne-Twister
    class MT {

        mIndex = 0n;

        // Default to MT19937-64
        // Note that 2 ** (n * w) - 1 must be a Mersenne prime
        constructor ({
            w = 64n, n = 312n, m = 156n,
            r = 31n, a = 0xB5026F5AA96619E9n,
            u = 29n, d = 0x5555555555555555n,
            s = 17n, b = 0x71D67FFFEDA60000n,
            t = 37n, c = 0xFFF7EEE000000000n,
            l = 43n, f = 0x5851F42D4C957F2Dn
        }) {
            this.w = w; this.n = n; this.m = m;
            this.r = r; this.a = a;
            this.u = u; this.d = d;
            this.s = s; this.b = b;
            this.t = t; this.c = c;
            this.l = l; this.f = f;
            this.mState = new BigUint64Array(Number(n));
            this.mMskAl = (1n << w) - 1n;
            this.mMskLo = (1n << r) - 1n;
            this.mMskHi = this.mMskAl ^ this.mMskLo;
        }

        // Twist
        twist () {
            const A = this.mState, a = this.a, n = this.n, lo = this.mMskLo, hi = this.mMskHi;
            let i = 0n, j = 1n, m = this.m;
            do {
                const x = (A[i] & hi) | (A[j] & lo), y = x >> 1n;
                A[i] = A[m] ^ (x & 1n ? y ^ a : y);
                if (++m >= n) { m = 0n; }
                if (++j >= n) { j = 0n; }
            } while (++i < n);
            this.mIndex = 0n;
        }

        // Seed
        seed (x = 0n) {
            const A = this.mState, n = this.n, f = this.f, w = this.w - 2n;
            A[n] = x;
            for (let i = 1n; i < n; i++) { A[i] = x = f * ((x ^ (x >> w)) + i); }
            this.twist();
        }

        // Roll
        step () {
            let y = this.mState[this.mIndex];
            y = y ^ ((y >> this.u) & this.d);
            y = y ^ ((y << this.s) & this.b);
            y = y ^ ((y << this.t) & this.c);
            y = y ^ (y >> this.l);
            if (++this.mIndex >= this.n) { this.twist(); }
            return y & this.mMskAl;
        }

        number (n) {
            return Number(Rng.step() % BigInt(n))
        }

        // 
        uniform () {
            return Number(this.step() & ((1n << 53n) - 1n)) * 1.1102230246251565e-16;
        }

        // 
        exp1 () {
            return -Math.log(1 - this.uniform());
        }

        // We employ the 2nd ordered statistic of 3 uniform to generate a random variable follows beta(2, 2).
        beta22 () {
            const a = this.uniform(), b = this.uniform(), c = this.uniform();
            return (a > b) ? 
                (b > c) ? b : (a > c) ? c : a :
                (a > c) ? a : (b > c) ? c : b ;
        }

        // We employ the 1st ordered statistic of 3 uniform to generate a random variable follows beta(1, 3).
        beta13 () {
            const a = this.uniform(), b = this.uniform(), c = this.uniform();
            return (a > b) ? 
                (b > c) ? c : b :
                (a > c) ? c : a ;
        }

        // We employ the 3rd ordered statistic of 3 uniform to generate a random variable follows beta(3, 1).
        beta31 () {
            const a = this.uniform(), b = this.uniform(), c = this.uniform();
            return (a > b) ? 
                (a > c) ? a : c :
                (b > c) ? b : c ;
        }

    }

    const 

        Rng = new MT({}),

        idSub = x => x,

        // Fisher-Yates
        rngShuffle = (A) => {
            let n = BigInt(A.length);
            while (n) {
                const i = Rng.step() % n; n--;
                [A[n], A[i]] = [A[i], A[n]];
            }
            return A;
        },

        // Generate raw BigInt
        rngBigInt = () => Rng.step(),

        // Generate integer number
        rngNumber = n => Rng.number(),

        // Uniform([0, 1])
        rngUniform = () => Rng.uniform(),

        // Exponential(1)
        rngExp1 = () => Rng.exp1(),

        // Beta(2, 2)
        rngBeta22 = () => Rng.beta22(),

        // Beta(1, 3)
        rngBeta13 = () => Rng.beta13(),

        // Beta(3, 1)
        rngBeta31 = () => Rng.beta31()
    ;
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Rng.seed(BigInt(Date.now())); // this.seed(BigInt(+Data.Seed || 0));

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    this.__proto__ = {

        SHA3, MT,

        Rng,

        idSub, 

        // Random Number Generator
        rngShuffle, rngNumber, rngBigInt, rngUniform, rngExp1, rngBeta22, rngBeta13, rngBeta31,
        
        // Construct an vector randomizer within N-dimensional cube
        // Should support N <= 16 (one could generalize this for any N by chaning bit counting algorithm below)
        // Keep in mind that the complexity is (2^N) for both time and space, so even if we could support large N, the cost would not be reasonable
        //
        // TODO:
        //   The result does not seemed to be distributed uniformly?
        //
        RngVec: (n) => {

            // Initialize lookup table
            const N = BigInt(n), NN = Number(N), T = Array(n).fill().map(() => []);
            n = (1n << BigInt(N)) - 1n;
            while (n--) {
                // Counting set bit of the 16-bit number
                let i = n - ((n >> 1n) & 0x5555n);
                i = (i & 0x3333n) + ((i >> 2n) & 0x3333n);
                T[(((i + (i >> 4n)) & 0xf0fn) * 0x101n) >> 0x8n & 0xffn].push(n);
            }

            // Returning a function:
            // Generates n-dimensional vector in the intersection of:
            //  - v0 + ... + vn = m
            //  - 0 < vi < 1
            // And then transform it to c1 * vi + c0
            return (m, c1, c0) => {
                const R = Array(NN);

                // If m is not in the possible range, return dummy value
                if (m >= NN) { return R.fill(c1 + c0); }
                R.fill(c0);
                if (m <= 0) { return R; }

                // Generate uniform weight of each vertex from the unit simplex
                const 
                    n = Math.floor(m), r = m - n, t = T[n], l = NN - n,
                    A = Array(t.length * l - 1).fill().map(rngUniform).sort()
                ;
                A.unshift(0); A.push(1);
                
                // Calculate the sampling point with scale factors
                let p0 = 0, p1 = 0;
                for (const n of t) {
                    let a = 0, b = N;
                    p1 = p0 + l;
                    do {
                        a += (A[p0] = (A[p0 + 1] - A[p0]) * c1);
                    } while (++p0 < p1);
                    while (b--) {
                        R[b] += (n >> b & 1n) ? a : A[--p1] * r;
                    }
                }
                return R;
            };
        }
    }
}
