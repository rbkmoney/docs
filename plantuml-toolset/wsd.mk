FORMAT ?= svg
SOURCEDIR ?= $(CURDIR)
SOURCES = $(shell find $(SOURCEDIR) -type f -name '*.wsd')
TARGETS = $(foreach fmt, $(FORMAT), $(patsubst %.wsd,%.$(fmt),$(SOURCES)))
STYLE ?= style.isvg

.PHONY: all clean install-toolset force

validate = test -s $@ || { rm $@; exit 1; }

all: $(TARGETS)

clean:
	rm -f $(TARGETS)

%.svg: %.wsd
	cat $< \
	| plantuml -tsvg -pipe \
	| xmllint --format - \
	| sed -e "/<g>/r $(STYLE)" \
	> $@
	$(validate)

%.png: %.wsd
	$(MAKE) $*.svg
	svgexport $*.svg $@ 2x && pngcrush -ow $@
	rm -vf $*.svg
	$(validate)


install-toolset: plantuml.tool xmllint.tool svgexport.tool pngcrush.tool
%.tool: force
	$(MAKE) $*.tool.$$(uname -s)
plantuml.tool.Darwin:
	brew install plantuml
svgexport.tool.Darwin:
	brew install npm
	npm install -g svgexport
pngcrush.tool.Darwin:
	brew install pngcrush
xmllint.tool.Darwin:
	true

force:
	@true
