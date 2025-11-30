FROM jenkins/jenkins:lts

USER root

# Install Docker inside Jenkins container
RUN apt-get update && \
    apt-get install -y docker.io docker-compose && \
    usermod -aG docker jenkins

# Create SSH directory for Jenkins
RUN mkdir -p /var/jenkins_home/.ssh/ && \
    chmod 700 /var/jenkins_home/.ssh/

# Install Jenkins plugins from plugins.txt
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# Optional: Jenkins Configuration as Code (JCasC)
ENV CASC_JENKINS_CONFIG=/var/jenkins_home/casc.yaml
COPY casc.yaml /var/jenkins_home/casc.yaml

USER jenkins
