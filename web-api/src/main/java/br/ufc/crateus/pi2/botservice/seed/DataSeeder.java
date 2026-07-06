package br.ufc.crateus.pi2.botservice.seed;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.ufc.crateus.pi2.botservice.models.Installment;
import br.ufc.crateus.pi2.botservice.models.Service;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.models.enums.EInstallmentStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EUserType;
import br.ufc.crateus.pi2.botservice.repositories.InstallmentRepository;
import br.ufc.crateus.pi2.botservice.repositories.ServiceRepository;
import br.ufc.crateus.pi2.botservice.repositories.UserRepository;
import br.ufc.crateus.pi2.botservice.services.UserService;
import br.ufc.crateus.pi2.botservice.services.commands.CreateUserCommand;

/**
 * Gera dados mockados ao subir o container, mantendo o fluxo real:
 *  - um catálogo de planos (Service) com valor de mensalidade;
 *  - um admin demo (admin@planeta.net / 123456) para acessar o painel;
 *  - um cliente demo (cliente@planeta.net / 123456) para testes determinísticos;
 *  - mensalidades em aberto para todo cliente que ainda não possua nenhuma.
 *
 * É idempotente: rodar várias vezes não duplica dados.
 */
@Component
public class DataSeeder implements CommandLineRunner
{
    private static final DateTimeFormatter MONTH = DateTimeFormatter.ofPattern("MM/yyyy");
    private static final int OPEN_MONTHS = 3;

    private static final String DEMO_EMAIL = "cliente@planeta.net";
    private static final String DEMO_PASSWORD = "123456";
    private static final String DEMO_CPF = "52998224725";

    private static final String ADMIN_EMAIL = "admin@planeta.net";
    private static final String ADMIN_PASSWORD = "123456";
    private static final String ADMIN_CPF = "11144477735";

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final InstallmentRepository installmentRepository;
    private final UserService userService;

    public DataSeeder(
        ServiceRepository serviceRepository,
        UserRepository userRepository,
        InstallmentRepository installmentRepository,
        UserService userService)
    {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.installmentRepository = installmentRepository;
        this.userService = userService;
    }

    @Override
    @Transactional
    public void run(String... args)
    {
        List<Service> plans = seedPlans();
        seedAdmin();
        seedDemoCustomer();
        seedOpenInstallments(plans);
    }

    private void seedAdmin()
    {
        if (userRepository.findByEmail(ADMIN_EMAIL).isPresent() || userRepository.existsByCpfCnpj(ADMIN_CPF))
            return;

        userService.add(new CreateUserCommand(
            "Admin Demo", ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_CPF, EUserType.ADMIN));
    }

    private List<Service> seedPlans()
    {
        if (serviceRepository.count() > 0)
            return serviceRepository.findAll();

        List<Service> plans = new ArrayList<>();
        plans.add(buildPlan("Plano Fibra 100MB", "Internet fibra óptica 100 Mbps", new BigDecimal("79.90")));
        plans.add(buildPlan("Plano Fibra 300MB", "Internet fibra óptica 300 Mbps", new BigDecimal("99.90")));
        plans.add(buildPlan("Plano Fibra 600MB", "Internet fibra óptica 600 Mbps", new BigDecimal("129.90")));
        return serviceRepository.saveAll(plans);
    }

    private Service buildPlan(String name, String description, BigDecimal monthlyAmount)
    {
        Service service = new Service();
        service.setName(name);
        service.setDescription(description);
        service.setMonthlyAmount(monthlyAmount);
        return service;
    }

    private void seedDemoCustomer()
    {
        if (userRepository.findByEmail(DEMO_EMAIL).isPresent() || userRepository.existsByCpfCnpj(DEMO_CPF))
            return;

        userService.add(new CreateUserCommand(
            "Cliente Demo", DEMO_EMAIL, DEMO_PASSWORD, DEMO_CPF, EUserType.CUSTOMER));
    }

    private void seedOpenInstallments(List<Service> plans)
    {
        if (plans.isEmpty())
            return;

        for (User user : userRepository.findAll())
        {
            if (user.getType() != EUserType.CUSTOMER)
                continue;
            if (installmentRepository.existsByUserId(user.getId()))
                continue;

            // Plano atribuído de forma determinística (sem aleatoriedade) com base no id do usuário.
            Service plan = plans.get((int) (Math.abs(user.getId()) % plans.size()));

            user.getServices().add(plan);
            userRepository.save(user);

            List<Installment> installments = new ArrayList<>();
            YearMonth current = YearMonth.now();
            for (int i = OPEN_MONTHS; i >= 1; i--)
            {
                Installment installment = new Installment();
                installment.setUser(user);
                installment.setService(plan);
                installment.setReferenceMonth(current.minusMonths(i).format(MONTH));
                installment.setAmount(plan.getMonthlyAmount());
                installment.setStatus(EInstallmentStatus.OPEN);
                installments.add(installment);
            }
            installmentRepository.saveAll(installments);
        }
    }
}
