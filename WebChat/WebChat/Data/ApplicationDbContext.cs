using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebChat.Models;

namespace WebChat.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Messages> Messages { get; set; }
    public DbSet<Status> Status { get; set; }
    public DbSet<StatusUpdate> StatusUpdates { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<Status>().HasOne(a => a.Sender)
                                .WithMany(b => b.UserStatus)
                                .HasForeignKey(c => c.SenderId);

        builder.Entity<StatusUpdate>().HasOne(a => a.Status)
                                        .WithMany(b => b.StatusUpdate)
                                        .HasForeignKey(c => c.StatusId);

        builder.Entity<StatusUpdate>().HasOne(a => a.Receiver)
                                        .WithMany(b => b.UpdatedStatus)
                                        .HasForeignKey(c => c.ReceiverId);
    }
}
