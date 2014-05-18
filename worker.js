var primes,
	isPrime = function( x ) {
		for ( var i = 0; i < primes.length; i++ ) {
			if ( x % primes[i] === 0 ) return false;
		}
		return true;
	};

self.onmessage = function( message ) {
	if ( message.data === false ) {
		// Told to wait for more data
		setTimeout(
			function() {
				self.postMessage( null )
			},
			500
		);
		return;
	}

	// We have something to parse, yay!
	primes = message.data.primes;
	var found_primes = [];

	for ( var i = message.data.start; i <= message.data.end; i++ ) {
		if ( isPrime( i ) ) {
			primes.push( i );
			found_primes.push( i );
		}
	}

	self.postMessage( { start: message.data.start, end: message.data.end, found_primes: found_primes } );
};

self.postMessage( null ); // Request a batch