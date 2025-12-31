package br.ufc.crateus.pi2.botservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Address extends BaseEntity
{
    @Id
    @Column(unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String street;

    private int number;

    private String neighborhood;

    private String city;

    private String state;

    private String zipCode;

    @OneToOne(mappedBy = "address")
    @JsonBackReference
    private User user;
}
