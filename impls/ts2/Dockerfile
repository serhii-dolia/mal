FROM ubuntu:22.04

##########################################################
# General requirements for testing or common across many
# implementations
##########################################################

RUN apt-get -y update

# Required for running tests
RUN apt-get -y install make python3 python-is-python3 curl

RUN mkdir -p /mal
WORKDIR /mal

RUN apt-get -y install gnupg
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

RUN apt-get -y install nodejs
