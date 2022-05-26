STEPS = step0_repl step1_read_print step2_eval step3_env

all: ts

node_modules:
	npm install

step%.js: node_modules step%.ts
	./node_modules/.bin/tsc -p ./


.PHONY: ts clean

ts: $(foreach s,$(STEPS),$(s).js)

clean:
	rm -f *.js *.js.map