FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline
COPY src/ src/
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre-jammy
RUN apt-get update \
    && apt-get install --no-install-recommends -y wget \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system storix \
    && useradd --system --gid storix --create-home storix
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
USER storix
EXPOSE 8080
HEALTHCHECK --interval=20s --timeout=5s --start-period=45s --retries=6 CMD ["sh", "-c", "wget -qO- http://localhost:8080/actuator/health | grep -q UP"]
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
