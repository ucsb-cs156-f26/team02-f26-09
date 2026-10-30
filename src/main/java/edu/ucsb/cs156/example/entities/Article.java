package edu.ucsb.cs156.example.entities;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import lombok.*;

/*
   Articles Database Entity.
*/
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "articles")
public class Article {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  String title;
  String url;
  String explanation;
  String email;
  ZonedDateTime dateAdded;
}
