package br.ufc.crateus.pi2.botservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "br.ufc.crateus.pi2.botservice.configs")
public class BotServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BotServiceApplication.class, args);
	}

}
