window.app = {};

app.go = (function(){
	var joiner = function*() {
		// How many workers should we use
		var worker_count = parseInt( document.getElementById( 'workercount' ).value, 10 ) || 2;

		// Set up initial state
		var primes = [],
			primes_to_find = 1000000,
			largest_processed = 0,
			batch_size = 1000,
			batches_sent = 0,
			batches_pending = 0;

		// Spin up the workers
		var requestBatch = function( message ) {
			// Do we have data?
			if ( message.data != null ) {
				Array.prototype.push.apply( primes, message.data.found_primes );
				largest_processed = Math.max( largest_processed, message.data.end );
				batches_pending--;
			}

			// What do we tell the worker
			if ( batches_sent === 0 ) {
				// First one is a special case, start processing at 2
				this.postMessage( { start: 2, end: batch_size, primes: primes } );
				batches_sent++;
				batches_pending++;
			} else if ( batches_pending > 0 ) {
				// Need to wait for all pending batches to complete before sending new ones
				this.postMessage( false );
			} else if ( batches_sent === primes_to_find / batch_size ) {
				// We've processed them all, shut down worker
				this.terminate();
				workers.splice( workers.indexOf( this ), 1 );
				joined.next(); // call generator function
			} else if ( largest_processed >= Math.sqrt( batches_sent * batch_size ) ) {
				// We have head room to continue processing )
				this.postMessage( { start: batches_sent * batch_size + 1, end: (++batches_sent) * batch_size + 1, primes: primes } );
				batches_pending++;
			} else {
				// Haven't processed enough numbers yet, tell worker to wait
				this.postMessage( false );
			}
		};

		var workers = [], worker;
		for ( var i = 0; i < worker_count; i++ ) {
			worker = new Worker( 'worker.js' );
			worker.onmessage = requestBatch;
			workers.push( worker );
		}

		// generator loop
		while ( true ) {
			yield null;
			if ( workers.length === 0 ) {
				// All workers have terminated, break out of generator loop
				break;
			}
		}

		document.getElementById( 'primes' ).innerHTML = primes.join( ', ' );
	},
	joined = joiner();

	return function(){
		document.getElementById( 'primes' ).innerHTML = 'Running...';
		joined.next() // Start everything
	};
})();