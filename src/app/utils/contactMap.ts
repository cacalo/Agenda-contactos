import { Contact, ContactGetDto, ContactNew, ContactPostDto } from "../interfaces/contact";

export function contactToContactPostDto(contact:Contact|ContactNew):ContactPostDto{
  const newContact : ContactPostDto = {
    FirstName: contact.firstName,
    LastName: contact.lastName,
    Number: contact.phone,
    Email: contact.email || "",
  }
  if(contact.address) newContact.Address = contact.address;
  if(contact.imageUrl) newContact.Image = contact.imageUrl;
  if(contact.company) newContact.Company = contact.company;
  if(contact.description) newContact.Description = contact.description;
  return newContact;
}

export function contactGetDtoToContact(contactDto:ContactGetDto):Contact{
  const contact : Contact = {
    id: contactDto.id,
    firstName: contactDto.firstName,
    lastName: contactDto.lastName,
    phone: contactDto.number,
    email: contactDto.email,
    isFavorite: contactDto.isFavorite || false,
    groupIds: contactDto.groupIds,
  }
  if(contactDto.image) contact.imageUrl = contactDto.image;
  if(contactDto.address) contact.address = contactDto.address;
  if(contactDto.company) contact.imageUrl = contactDto.company;
  return contact;
}