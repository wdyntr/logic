class LinkedListNode<T> {
    data: T;
    next: LinkedListNode<T> | null;
    constructor(data: T) {
        this.data = data;
        this.next = null;
    }
}

export class LinkedList<T> {
    private head: LinkedListNode<T> | null = null;
    private tail: LinkedListNode<T> | null = null

    append(data: T): void {  // tambah di akhir
        const newNode = new LinkedListNode(data);

        // Kasus 1: Jika list masih kosong
        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode
            return;
        }

        // Sambungkan node baru di akhir list
        this.tail!.next = newNode;
        this.tail = newNode
    }


    prepend(data: T): void {  // tambah di awal
        // kalau kosong
        const newNode = new LinkedListNode(data);
        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode
            return;
        }

        // kalau ada isinya
        newNode.next = this.head
        this.head = newNode
    }

    delete(data: T): boolean { // hapus pertama kali data ditemukan
        // 1. Handle list kosong
        if (!this.head) return false;

        // 2. Handle head
        if (this.head.data === data) {
            this.head = this.head.next;
            if (!this.head) this.tail = null;
            return true;
        }

        // 3. Traverse cari node SEBELUM node yang mau dihapus
        let current = this.head;
        while (current.next) {
            if (current.next.data === data) {
                current.next = current.next.next;  // skip node
                if (!current.next) this.tail = current;
                return true;
            }
            current = current.next;
        }

        return false;
    }

    find(data: T): boolean {       // cari data ada/tidak
        let current = this.head
        while (current !== null) {
            if (current.data === data) return true
            current = current.next
        }
        return false
    }

    toArray(): T[] {               // convert ke array (untuk display)
        let current = this.head
        const result: T[] = []

        while (current !== null) {
            result.push(current.data)
            current = current.next;
        }

        return result
    }

    get size(): number {          // jumlah node
        let count = 0
        let current = this.head

        while (current !== null) {
            count += 1
            current = current.next
        }

        return count
    }
}