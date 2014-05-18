We will use Web Workers to find all prime numbers under one million. The focus here is not to use the most efficient
method but to implement a generator function to join on the workers. To calculate the prime number we will count from
2 to 1,000,000, keeping track of any primes we encounter. We record a number as prime if it is not evenly divisible by
a prime we have already encountered. A single threaded implementation of this is

```javascript
var primes = [];

var isPrime = function( x ) {
    for ( var i = 0; i < primes.length; i++ ) {
        if ( x % primes[i] === 0 ) return false;
    }
    return true;
};

for ( var i = 2; i < 1000000; i++ ) {
    if ( isPrime( i ) ) {
        primes.push( i );
    }
}
```

We will send the numbers to the workers in batches of 100 along with an updated list of prime numbers. This problem can
be split into batches because a number can not be evenly divided by anything greater than its square root. For example,
after we find all primes between 1 and 100 we can safely batch `101-200`,`201-300`...`9901-10000` because all numbers
<= 10000 have divisors <= 100.

This gives us an interface to implement. The main app needs to maintain a list of found primes as well as the largest
number already tested. The app will expose methods for web workers to 1) request the next batch and 2) report new primes.
As the app spins up the workers it will use a generator to join on the workers, and each worker will be terminated from
the app when it requests a batch after the last one has been sent.

We start by creating a generator function which will act as the main thread. In `app.js` I got creative and named this
function `joiner`. It does everything from state management to worker creation, and contains the logic for communicating
with the workers as they send back results. The relevant section for joining on the threads is on [lines 42-56](https://github.com/chandlerprall/WebWorkerJoining/blob/master/app.js#L42-56). `joiner`
spins up the requested workers and then it simply `yields` inside a while loop. The generator is called again on [line
32](https://github.com/chandlerprall/WebWorkerJoining/blob/master/app.js#L32) every time a worker is terminated, each time checking to see if there are any remaining workers. When there are no
more workers the generator loop is finally broken and the final results are displayed on the page.

[Want to see it in action](http://chandlerprall.github.io/WebWorkerJoining/)? Generator functions are currently implemented in Firefox, and behind the `Enable Experimental Javascript` / `#enable-javascript-harmony` flag in Chrome.
