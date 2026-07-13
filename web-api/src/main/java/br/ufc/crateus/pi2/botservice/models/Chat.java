package br.ufc.crateus.pi2.botservice.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;

import br.ufc.crateus.pi2.botservice.models.enums.EChatStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EChatType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Chat extends BaseEntity
{
    @Id
    @Column(unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private String playbook;

    private Integer currentStep;

    @Enumerated(EnumType.STRING)
    private EChatType type;

    // chatRating é o atributo de nota do chat (1 a 5), pode ser null.
    // A faixa 1-5 é validada na aplicação em ChatService.processarMensagem;
    // não usamos @Min/@Max aqui porque geram um CHECK constraint que rejeita NULL.
    private Integer chatRating;

    @Enumerated(EnumType.STRING)
    private EChatStatus chatStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"chats", "services", "password"})
    private User user;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Message> messages = new ArrayList<>();

    // Conteúdo da última mensagem do chat, mantido sincronizado em MessageService.save
    // para exibir no card da lista de conversas sem consultar a tabela de mensagens.
    @Column(columnDefinition = "TEXT")
    private String lastMessage;
}
