---
tags: [kernel, syscalls]
date: 2026-09-20
---
# What an Operating System Actually Does

**Description:** The kernel as a referee: protection rings, system calls and why your program can't touch hardware directly.

Every program you run believes it has the whole machine to itself: all the memory, all the CPU, every file. None of that is true. The **operating system** keeps up that illusion for every program at once, safely.

## Three jobs of an OS

1. **Abstraction** – files instead of disk sectors, sockets instead of network cards
2. **Resource sharing** – many programs, one CPU and one pool of memory
3. **Protection** – one buggy program must not crash the others

## User mode and kernel mode

The CPU runs in at least two privilege levels. Your code runs in **user mode** (ring 3) and cannot execute privileged instructions. The kernel runs in **kernel mode** (ring 0) with full access.

> If user code could disable interrupts or rewrite page tables, any program could take over the machine. Privilege levels are what make multitasking safe.

## System calls

When a program needs something only the kernel can do, it makes a **system call**.

```c
#include <unistd.h>

int main(void) {
    const char msg[] = "hello from user space\n";
    write(1, msg, sizeof msg - 1);   // syscall: ask the kernel to write to stdout
    return 0;
}
```

Run it with `strace ./a.out` and you'll see the `write` call cross into the kernel.

| Syscall | What it asks the kernel to do |
|---|---|
| `open` / `read` / `write` | File and device I/O |
| `fork` / `exec` | Create and replace processes |
| `mmap` | Map memory into the address space |
| `socket` | Talk to the network |

## Key takeaways

- The OS is a referee between programs and hardware.
- User code runs unprivileged; the kernel runs privileged.
- System calls are the only door between the two.
