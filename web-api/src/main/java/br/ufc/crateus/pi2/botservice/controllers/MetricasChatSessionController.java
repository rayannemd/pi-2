package br.ufc.crateus.pi2.botservice.controllers;

import java.time.LocalDate;

import org.springframework.web.bind.annotation.CrossOrigin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.dto.MetricasChatSession;
import br.ufc.crateus.pi2.botservice.services.MetricasChatSessionService;

@CrossOrigin(origins = "http://localhost:5173")

@RestController
@RequestMapping("/dashboard")
public class MetricasChatSessionController {
    private final MetricasChatSessionService metricasService;

    public MetricasChatSessionController(MetricasChatSessionService metricasService){
        this.metricasService = metricasService;
    }

    @GetMapping // nao sei se é assim mesmo que fica
    public ResponseEntity<MetricasChatSession> filtrarPorData(@RequestParam int qtdDias){
        LocalDate dataFim = LocalDate.now();
        LocalDate dataInicio = dataFim.minusDays(qtdDias);
        return ResponseEntity.ok(metricasService.filtrarPorData(dataInicio, dataFim));
    }
}
