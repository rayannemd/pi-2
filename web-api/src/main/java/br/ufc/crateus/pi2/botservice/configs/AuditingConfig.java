package br.ufc.crateus.pi2.botservice.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories("br.ufc.crateus.pi2.botservice.repositories")
public class AuditingConfig 
{
    
}
