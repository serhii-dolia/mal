STEPS = step0_repl

all: ts

node_modules:
	npm install

step%.js: node_modules step%.ts
	./node_modules/.bin/tsc -p ./


.PHONY: ts clean

ts: $(foreach s,$(STEPS),$(s).js)

clean:
	rm -f *.js