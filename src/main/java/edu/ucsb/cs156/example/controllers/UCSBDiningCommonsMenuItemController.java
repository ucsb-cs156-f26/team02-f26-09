package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.UCSBDiningCommonsMenuItemRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** This is a REST controller for UCSBDiningCommonsMenuItem */
@Tag(name = "UCSBDiningCommonsMenuItem")
@RequestMapping("/api/UCSBDiningCommonsMenuItem")
@RestController
@Slf4j
public class UCSBDiningCommonsMenuItemController extends ApiController {

  @Autowired UCSBDiningCommonsMenuItemRepository ucsbDiningCommonsMenuItemRepository;

  /**
   * This method returns a list of all UCSBDiningCommonsMenuItems.
   *
   * @return a list of all UCSBDiningCommonsMenuItems
   */
  @Operation(summary = "List all UCSB dining commons menu items")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<UCSBDiningCommonsMenuItem> allMenuItems() {
    Iterable<UCSBDiningCommonsMenuItem> menuItems = ucsbDiningCommonsMenuItemRepository.findAll();
    return menuItems;
  }

  /**
   * This method returns a single UCSBDiningCommonsMenuItem.
   *
   * @param id id of the menu item
   * @return a single UCSBDiningCommonsMenuItem
   */
  @Operation(
      summary = "Get a single UCSB dining commons menu item",
      description =
          "Returns the menu item with the given id, or a 404 error if no menu item has that id")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public UCSBDiningCommonsMenuItem getById(
      @Parameter(name = "id", description = "id of the menu item to get") @RequestParam Long id) {
    UCSBDiningCommonsMenuItem menuItem =
        ucsbDiningCommonsMenuItemRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(UCSBDiningCommonsMenuItem.class, id));

    return menuItem;
  }

  /**
   * This method creates a new UCSBDiningCommonsMenuItem. Accessible only to users with the role
   * "ROLE_ADMIN".
   *
   * @param diningCommonsCode code of the dining commons that serves the menu item
   * @param name name of the menu item
   * @param station station in the dining commons where the menu item is served
   * @return the saved menu item
   */
  @Operation(summary = "Create a new UCSB dining commons menu item")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public UCSBDiningCommonsMenuItem postMenuItem(
      @Parameter(
              name = "diningCommonsCode",
              description = "code of the dining commons that serves the item, e.g. ortega")
          @RequestParam
          String diningCommonsCode,
      @Parameter(name = "name", description = "name of the menu item, e.g. Baked Pesto Pasta")
          @RequestParam
          String name,
      @Parameter(
              name = "station",
              description = "station where the item is served, e.g. Entree Specials")
          @RequestParam
          String station) {

    UCSBDiningCommonsMenuItem menuItem = new UCSBDiningCommonsMenuItem();
    menuItem.setDiningCommonsCode(diningCommonsCode);
    menuItem.setName(name);
    menuItem.setStation(station);

    UCSBDiningCommonsMenuItem savedMenuItem = ucsbDiningCommonsMenuItemRepository.save(menuItem);

    return savedMenuItem;
  }

  /**
   * Delete a UCSBDiningCommonsMenuItem. Accessible only to users with the role "ROLE_ADMIN".
   *
   * @param id id of the menu item to delete
   * @return a message indicating the menu item was deleted
   */
  @Operation(
      summary = "Delete a UCSB dining commons menu item",
      description =
          "Deletes the menu item with the given id and returns a message confirming it was deleted, or a 404 error if no menu item has that id")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteMenuItem(
      @Parameter(name = "id", description = "id of the menu item to delete") @RequestParam
          Long id) {
    UCSBDiningCommonsMenuItem menuItem =
        ucsbDiningCommonsMenuItemRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(UCSBDiningCommonsMenuItem.class, id));

    ucsbDiningCommonsMenuItemRepository.delete(menuItem);
    return genericMessage("UCSBDiningCommonsMenuItem with id %s deleted".formatted(id));
  }

  /**
   * Update a single UCSBDiningCommonsMenuItem. Accessible only to users with the role "ROLE_ADMIN".
   *
   * @param id id of the menu item to update
   * @param incoming the new menu item contents
   * @return the updated menu item
   */
  @Operation(
      summary = "Update a single UCSB dining commons menu item",
      description =
          "Replaces diningCommonsCode, name, and station of the menu item with the given id using the values in the JSON request body (any id in the body is ignored). Returns the updated menu item, or a 404 error if no menu item has that id")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public UCSBDiningCommonsMenuItem updateMenuItem(
      @Parameter(name = "id", description = "id of the menu item to update") @RequestParam Long id,
      @RequestBody @Valid UCSBDiningCommonsMenuItem incoming) {

    UCSBDiningCommonsMenuItem menuItem =
        ucsbDiningCommonsMenuItemRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(UCSBDiningCommonsMenuItem.class, id));

    menuItem.setDiningCommonsCode(incoming.getDiningCommonsCode());
    menuItem.setName(incoming.getName());
    menuItem.setStation(incoming.getStation());

    ucsbDiningCommonsMenuItemRepository.save(menuItem);

    return menuItem;
  }
}
