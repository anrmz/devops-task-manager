FROM jenkins/jenkins:lts

USER root

# install nodejs + npm
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# install docker cli
RUN apt-get install -y docker.io

USER jenkins