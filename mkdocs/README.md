# Plantuml toolset

A couple of helpful shortcuts to generate `svg` or `png` images out of [plantuml](http://plantuml.com) diagrams. Wacky skin included.

See it yourself:

<img src="examples/conversation.png" width="40%" />

## Using

It is better to include it in your handcrafted `Makefile` like that:

```
include plantuml-toolset/wsd.mk
...
```

After that you can invoke it in a number of ways:

```shell
# Find all *.wsd in the current directory recursively and make svg's out of them
$ make

# Same but make png's
$ make FORMAT=png

# Same but make both png's and svg's
$ make FORMAT="png svg"

# Make examples/conversation.png
$ make FORMAT=png examples/conversation.wsd
```

> _The more you know._ If you want to render png's properly be sure to install [Neucha](https://www.google.com/fonts/specimen/Neucha) system wide.
