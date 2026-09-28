---
tags: [processes, kernel]
date: 2026-09-24
---
# Processes and the PCB

**Description:** How the kernel tracks every running program, and what a context switch really costs.

A **program** is a file on disk. A **process** is that program *running*: code plus a live set of registers, a stack, open files and a slice of memory. Run `python app.py` twice and you get one program but two processes.

## What the kernel stores about a process

Every process is described by a **Process Control Block (PCB)**. In Linux it's `struct task_struct`, and it is large: over 600 fields.

| Field | Why it exists |
|---|---|
| PID, parent PID | Identity and the process tree |
| State | Running, ready, waiting, zombie |
| Program counter + registers | Where to resume after a switch |
| Page table pointer | This process's view of memory |
| Open file table | Every fd it holds |
| Scheduling info | Priority, CPU time used |

> **Rule of thumb:** if the kernel needs it to pause and later resume a process exactly where it stopped, it lives in the PCB.

## Process states

A process moves between five states. The scheduler only picks from **Ready**.

1. **New** – being created
2. **Ready** – waiting for a CPU
3. **Running** – on a CPU right now
4. **Waiting** – blocked on I/O or an event
5. **Terminated** – finished, waiting for the parent to collect its exit code

### Zombies and orphans

A child that exits before its parent calls `wait()` becomes a **zombie**: dead, but its PCB lingers so the exit status isn't lost. If the parent dies first, the child is an **orphan** and gets adopted by `init` (PID 1).

## Creating a process with fork()

`fork()` clones the calling process. Both copies continue from the same line; the return value tells them apart.

```c
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        printf("child: my pid is %d\n", getpid());
        execlp("ls", "ls", "-l", NULL);   // replace child with ls
    } else {
        wait(NULL);                        // reap the child, no zombie
        printf("parent: child %d finished\n", pid);
    }
    return 0;
}
```

Modern kernels use **copy-on-write**, so `fork()` doesn't copy memory until one side writes to a page.

## The cost of a context switch

Switching from process A to B means saving A's registers into its PCB, loading B's, and switching page tables. The direct cost is a few microseconds. The indirect cost is larger: B starts with a **cold cache and TLB**.

- Direct: ~1–5 µs on modern x86
- Indirect: cache refills can cost 10× more
- Threads in the same process skip the page-table switch, which is why they're cheaper

## Key takeaways

- A process is a program in execution, described by its PCB.
- `fork()` + `exec()` is how Unix starts new programs.
- Context switches are cheap in isolation and expensive in aggregate.
