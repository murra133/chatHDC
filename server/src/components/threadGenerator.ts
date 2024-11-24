// In 'src/utils/ThreadedGenerator.ts'
import { EventEmitter } from 'events';

export default class ThreadedGenerator extends EventEmitter {
    private done: boolean = false;
    private buffer: any[] = [];

    send(data: any) {
        this.buffer.push(data);
        this.emit('data', data);
    }

    close() {
        this.done = true;
        this.emit('end');
    }

    // Implement the async iterator
    async *[Symbol.asyncIterator]() {
        while (!this.done || this.buffer.length > 0) {
            // Process the buffer immediately if it has data
            while (this.buffer.length > 0) {
                yield this.buffer.shift(); // Emit items already in the buffer
            }
    
            // Wait for new data only if the buffer is empty
            if (!this.done) {
                await new Promise<void>((resolve) => this.once('data', resolve));
            }
        }
    }
}