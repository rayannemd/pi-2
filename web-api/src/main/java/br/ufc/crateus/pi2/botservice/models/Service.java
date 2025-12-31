package br.ufc.crateus.pi2.botservice.models;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Service extends BaseEntity
{
    @Id
    @Column(unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    @ManyToOne(cascade = CascadeType.ALL)
    private Set<User> users = new HashSet<>();
}
